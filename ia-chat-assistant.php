<?php
/**
 * Plugin Name: IA Chat Assistant
 * Description: Website chat assistant for 713botoxme.com. Answers common questions from the site's own
 *              content using Claude (default) or ChatGPT, chosen in settings, captures leads (contact info + service interest, with consent)
 *              into a database table, and emails a daily digest of new leads for human follow-up.
 *              Health details are never stored or emailed. Added 2026-11-21.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'IA_CHAT_DB_VER', '1' );
define( 'IA_CHAT_OPT', 'ia_chat_settings' );

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function ia_chat_settings() {
	$defaults = array(
		'enabled'      => 0,
		'provider'     => 'claude',
		'api_key'      => '',
		'openai_key'   => '',
		'model'        => '',
		'name'         => 'Ava',
		'notify_email' => 'info@713botoxme.com',
		'digest_hour'  => 8,
	);
	$s = get_option( IA_CHAT_OPT, array() );
	$s = array_merge( $defaults, is_array( $s ) ? $s : array() );
	if ( '' === $s['model'] ) {
		$s['model'] = 'openai' === $s['provider'] ? 'gpt-5-mini' : 'claude-sonnet-5-5';
	}
	return $s;
}

function ia_chat_key() {
	$s = ia_chat_settings();
	return (string) ( 'openai' === $s['provider'] ? $s['openai_key'] : $s['api_key'] );
}

function ia_chat_ready() {
	$s = ia_chat_settings();
	return ! empty( $s['enabled'] ) && '' !== ia_chat_key();
}

/* ------------------------------------------------------------------ */
/* Database                                                            */
/* ------------------------------------------------------------------ */

function ia_chat_table() {
	global $wpdb;
	return $wpdb->prefix . 'ia_chat_leads';
}

add_action(
	'init',
	function () {
		if ( get_option( 'ia_chat_db_ver' ) === IA_CHAT_DB_VER ) {
			return;
		}
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$t       = ia_chat_table();
		$charset = $wpdb->get_charset_collate();
		dbDelta(
			"CREATE TABLE $t (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			session varchar(64) NOT NULL,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			name varchar(120) NOT NULL DEFAULT '',
			phone varchar(40) NOT NULL DEFAULT '',
			email varchar(160) NOT NULL DEFAULT '',
			preferred_location varchar(60) NOT NULL DEFAULT '',
			service_interest varchar(200) NOT NULL DEFAULT '',
			best_time varchar(120) NOT NULL DEFAULT '',
			contact_method varchar(40) NOT NULL DEFAULT '',
			language varchar(20) NOT NULL DEFAULT '',
			consent tinyint(1) NOT NULL DEFAULT 0,
			summary text NULL,
			landing_page varchar(300) NOT NULL DEFAULT '',
			chat_page varchar(300) NOT NULL DEFAULT '',
			referrer varchar(300) NOT NULL DEFAULT '',
			utm_source varchar(100) NOT NULL DEFAULT '',
			utm_medium varchar(100) NOT NULL DEFAULT '',
			utm_campaign varchar(150) NOT NULL DEFAULT '',
			gclid varchar(200) NOT NULL DEFAULT '',
			messages int(11) NOT NULL DEFAULT 0,
			emailed_at datetime NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY session (session),
			KEY created_at (created_at)
		) $charset;"
		);
		update_option( 'ia_chat_db_ver', IA_CHAT_DB_VER );
	}
);

/* ------------------------------------------------------------------ */
/* Knowledge base: text of key site pages, refreshed daily            */
/* ------------------------------------------------------------------ */

function ia_chat_kb_pages() {
	return array(
		'/', '/locations', '/faq', '/book-consultation', '/contact', '/payment-plans', '/memberships-offers',
		'/treatments', '/injectables', '/medspa', '/weight-loss', '/treatment-glp1-weight-loss-consultation',
		'/treatment-semaglutide', '/treatment-tirzepatide', '/peptides', '/treatment-physician-supervised-peptide-therapy',
		'/longevity-medicine', '/treatment-hormone-optimization-men', '/treatment-hormone-optimization-women',
		'/treatment-erectile-dysfunction', '/telehealth', '/online', '/online/pricing', '/online/faq', '/online/weight-loss',
		'/online/peptides', '/online/refund-policy', '/team', '/about',
		'/botox-houston-tx', '/botox-conroe-tx', '/botox-fulshear-tx', '/botox-katy-tx',
	);
}

function ia_chat_html_to_text( $html ) {
	$html = preg_replace( '#<(script|style|noscript|svg|nav|header|footer|form|iframe)\b[^>]*>.*?</\1>#is', ' ', $html );
	if ( preg_match( '#<main\b[^>]*>(.*)</main>#is', $html, $m ) ) {
		$html = $m[1];
	}
	$html = preg_replace( '#<(br|/p|/li|/h[1-6]|/tr|/div)\b[^>]*>#i', "\n", $html );
	$text = wp_strip_all_tags( $html );
	$text = html_entity_decode( $text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	$text = preg_replace( "/[ \t\x{00A0}]+/u", ' ', $text );
	$text = preg_replace( "/\n\s*\n+/", "\n", $text );
	return trim( $text );
}

function ia_chat_build_kb() {
	$parts = array();
	$llms  = ABSPATH . 'llms.txt';
	if ( file_exists( $llms ) ) {
		$parts[] = "=== SITE OVERVIEW (llms.txt) ===\n" . file_get_contents( $llms );
	}
	foreach ( ia_chat_kb_pages() as $path ) {
		$r = wp_remote_get( home_url( $path ), array( 'timeout' => 20 ) );
		if ( is_wp_error( $r ) || 200 !== (int) wp_remote_retrieve_response_code( $r ) ) {
			continue;
		}
		$text = ia_chat_html_to_text( wp_remote_retrieve_body( $r ) );
		if ( strlen( $text ) < 80 ) {
			continue;
		}
		$parts[] = '=== PAGE ' . home_url( $path ) . " ===\n" . mb_substr( $text, 0, 7000 );
	}
	$kb = mb_substr( implode( "\n\n", $parts ), 0, 160000 );
	update_option( 'ia_chat_kb', $kb, false );
	update_option( 'ia_chat_kb_built', current_time( 'mysql' ), false );
	return strlen( $kb );
}

/* ------------------------------------------------------------------ */
/* OpenAI API                                                          */
/* ------------------------------------------------------------------ */

function ia_chat_system_prompt() {
	$s     = ia_chat_settings();
	$name  = $s['name'];
	$today = wp_date( 'l, F j, Y' );
	return <<<TXT
You are {$name}, the website assistant for Identity Aesthetics (713botoxme.com), a physician-led med spa and medical wellness practice in the Houston area with telehealth. Today is {$today}.

HOW TO TALK
- Sound like a warm, upbeat, experienced front-desk coordinator: natural, friendly, concise (usually 1-3 short sentences), one question at a time. No lists unless the visitor asks for details.
- Reply in the visitor's language (English or Spanish).
- You are an AI assistant. Never claim to be a human. If asked, say you're the practice's virtual assistant and that a real team member personally follows up.

WHAT YOU KNOW
- Answer ONLY from the BUSINESS INFORMATION below. If something isn't there (a price, an hour, a product), say you'll have the team confirm it and offer to take their contact info. Never guess prices, availability or results.
- Share useful links from the business information as plain URLs (for example https://713botoxme.com/book-consultation).
- Ways to reach the practice: call 713-268-6963 (713-BOTOX-ME), text (832) 979-9105, or book online at https://713botoxme.com/book-consultation.
- Kingwood is an independently owned franchise with its own website; send Kingwood questions there.

MEDICAL AND COMPLIANCE RULES
- You give general information only, never medical advice, diagnosis, dosing or eligibility decisions. Candidacy for any prescription is decided by a licensed provider after a consultation and labs where required.
- Do not ask about health conditions, medications, weight or medical history. If a visitor volunteers them, respond kindly without repeating the details, and suggest a consultation. Never put health details in save_lead.
- Never call compounded medications FDA-approved or the same as brand-name drugs. Never promise results.
- If someone describes an emergency or severe symptoms, tell them to call 911 or go to the nearest ER.

COLLECTING CONTACT INFO (for a personal follow-up)
- When a visitor shows interest (asks about price, booking, a treatment, a program), naturally offer to have a team member reach out, and ask for their first name and the best phone number or email. Then, conversationally, their preferred location (Houston, Conroe, Fulshear, Katy or telehealth), the service they're interested in, and a good time to reach them.
- Before saving, ask plainly whether it's OK for the team to call, text or email them. Only call save_lead after they say yes (consent=true). If they decline, respect it and keep helping.
- You may call save_lead again later in the chat to update details. After saving, confirm warmly that someone from the team will reach out, and offer the booking link if they'd like to pick a time now.
- Don't pressure. If they just want an answer, answer it.

BUSINESS INFORMATION
TXT;
}

function ia_chat_tools() {
	return array(
		array(
			'type'     => 'function',
			'function' => array(
				'name'        => 'save_lead',
				'description' => 'Save or update the visitor\'s contact details for a personal follow-up by the team. Only call after the visitor has agreed to be contacted. Never include health details.',
				'parameters'  => array(
					'type'       => 'object',
					'properties' => array(
						'name'               => array( 'type' => 'string', 'description' => 'Visitor name as given' ),
						'phone'              => array( 'type' => 'string' ),
						'email'              => array( 'type' => 'string' ),
						'preferred_location' => array( 'type' => 'string', 'description' => 'Houston, Conroe, Fulshear, Katy, Telehealth or unknown' ),
						'service_interest'   => array( 'type' => 'string', 'description' => 'Service(s) of interest, e.g. Botox, lip filler, GLP-1 weight loss, peptides' ),
						'best_time'          => array( 'type' => 'string' ),
						'contact_method'     => array( 'type' => 'string', 'description' => 'call, text or email' ),
						'language'           => array( 'type' => 'string', 'description' => 'English or Spanish' ),
						'summary'            => array( 'type' => 'string', 'description' => 'One or two sentences on what they want help with. No medical or health details.' ),
						'consent'            => array( 'type' => 'boolean', 'description' => 'True only if the visitor agreed to be contacted' ),
					),
					'required'   => array( 'consent' ),
				),
			),
		),
	);
}

/**
 * Call the OpenAI Chat Completions API (ChatGPT). Returns choices[0] or WP_Error.
 */
function ia_chat_call_openai( $messages ) {
	$s    = ia_chat_settings();
	$kb   = (string) get_option( 'ia_chat_kb', '' );
	$body = array(
		'model'                 => $s['model'],
		'messages'              => array_merge(
			array( array( 'role' => 'system', 'content' => ia_chat_system_prompt() . "\n" . $kb ) ),
			$messages
		),
		'tools'                 => ia_chat_tools(),
		'max_completion_tokens' => 2500,
	);
	$r = wp_remote_post(
		'https://api.openai.com/v1/chat/completions',
		array(
			'timeout' => 60,
			'headers' => array(
				'Authorization' => 'Bearer ' . $s['openai_key'],
				'Content-Type'  => 'application/json',
			),
			'body'    => wp_json_encode( $body ),
		)
	);
	if ( is_wp_error( $r ) ) {
		update_option( 'ia_chat_last_error', current_time( 'mysql' ) . ' ' . $r->get_error_message(), false );
		return new WP_Error( 'ia_chat_http', $r->get_error_message() );
	}
	$code = (int) wp_remote_retrieve_response_code( $r );
	$data = json_decode( wp_remote_retrieve_body( $r ), true );
	if ( 200 !== $code || ! is_array( $data ) || empty( $data['choices'][0]['message'] ) ) {
		$msg = is_array( $data ) && isset( $data['error']['message'] ) ? $data['error']['message'] : 'HTTP ' . $code;
		update_option( 'ia_chat_last_error', current_time( 'mysql' ) . ' ' . $msg, false );
		return new WP_Error( 'ia_chat_api', $msg );
	}
	return $data['choices'][0];
}


/**
 * Dispatcher: returns an OpenAI-shaped choice array (message.content, message.tool_calls).
 */
function ia_chat_call_llm( $messages ) {
	return 'openai' === ia_chat_settings()['provider'] ? ia_chat_call_openai( $messages ) : ia_chat_call_claude( $messages );
}

/**
 * Call the Anthropic Messages API (Claude), translating to/from the OpenAI-style message list used here.
 */
function ia_chat_call_claude( $messages ) {
	$s     = ia_chat_settings();
	$kb    = (string) get_option( 'ia_chat_kb', '' );
	$tools = array();
	foreach ( ia_chat_tools() as $t ) {
		$tools[] = array( 'name' => $t['function']['name'], 'description' => $t['function']['description'], 'input_schema' => $t['function']['parameters'] );
	}
	$msgs = array();
	foreach ( $messages as $m ) {
		if ( 'tool' === $m['role'] ) {
			$block = array( 'type' => 'tool_result', 'tool_use_id' => $m['tool_call_id'], 'content' => (string) $m['content'] );
			$last  = count( $msgs ) - 1;
			if ( $last >= 0 && 'user' === $msgs[ $last ]['role'] && is_array( $msgs[ $last ]['content'] ) ) {
				$msgs[ $last ]['content'][] = $block;
			} else {
				$msgs[] = array( 'role' => 'user', 'content' => array( $block ) );
			}
		} elseif ( 'assistant' === $m['role'] && ! empty( $m['tool_calls'] ) ) {
			$content = array();
			if ( ! empty( $m['content'] ) ) {
				$content[] = array( 'type' => 'text', 'text' => (string) $m['content'] );
			}
			foreach ( $m['tool_calls'] as $c ) {
				$args      = json_decode( (string) $c['function']['arguments'], true );
				$content[] = array( 'type' => 'tool_use', 'id' => $c['id'], 'name' => $c['function']['name'], 'input' => is_array( $args ) && $args ? $args : new stdClass() );
			}
			$msgs[] = array( 'role' => 'assistant', 'content' => $content );
		} else {
			$msgs[] = array( 'role' => $m['role'], 'content' => (string) $m['content'] );
		}
	}
	$body = array(
		'model'      => $s['model'],
		'max_tokens' => 800,
		'system'     => array( array( 'type' => 'text', 'text' => ia_chat_system_prompt() . "\n" . $kb, 'cache_control' => array( 'type' => 'ephemeral' ) ) ),
		'tools'      => $tools,
		'messages'   => $msgs,
	);
	$r = wp_remote_post(
		'https://api.anthropic.com/v1/messages',
		array(
			'timeout' => 60,
			'headers' => array( 'x-api-key' => $s['api_key'], 'anthropic-version' => '2023-06-01', 'content-type' => 'application/json' ),
			'body'    => wp_json_encode( $body ),
		)
	);
	if ( is_wp_error( $r ) ) {
		update_option( 'ia_chat_last_error', current_time( 'mysql' ) . ' ' . $r->get_error_message(), false );
		return new WP_Error( 'ia_chat_http', $r->get_error_message() );
	}
	$code = (int) wp_remote_retrieve_response_code( $r );
	$data = json_decode( wp_remote_retrieve_body( $r ), true );
	if ( 200 !== $code || ! is_array( $data ) || ! isset( $data['content'] ) ) {
		$msg = is_array( $data ) && isset( $data['error']['message'] ) ? $data['error']['message'] : 'HTTP ' . $code;
		update_option( 'ia_chat_last_error', current_time( 'mysql' ) . ' ' . $msg, false );
		return new WP_Error( 'ia_chat_api', $msg );
	}
	$text  = '';
	$calls = array();
	foreach ( $data['content'] as $b ) {
		if ( 'text' === $b['type'] ) {
			$text .= $b['text'];
		} elseif ( 'tool_use' === $b['type'] ) {
			$calls[] = array( 'id' => $b['id'], 'type' => 'function', 'function' => array( 'name' => $b['name'], 'arguments' => wp_json_encode( $b['input'] ) ) );
		}
	}
	$message = array( 'role' => 'assistant', 'content' => $text );
	if ( $calls ) {
		$message['tool_calls'] = $calls;
	}
	return array( 'message' => $message );
}

/* ------------------------------------------------------------------ */
/* Leads                                                               */
/* ------------------------------------------------------------------ */

function ia_chat_clean( $v, $len ) {
	return mb_substr( sanitize_text_field( (string) $v ), 0, $len );
}

function ia_chat_save_lead( $session, $in, $ctx ) {
	global $wpdb;
	if ( empty( $in['consent'] ) ) {
		return 'Not saved: the visitor has not agreed to be contacted yet. Ask for permission first.';
	}
	$row = array(
		'name'               => ia_chat_clean( $in['name'] ?? '', 120 ),
		'phone'              => ia_chat_clean( $in['phone'] ?? '', 40 ),
		'email'              => sanitize_email( $in['email'] ?? '' ),
		'preferred_location' => ia_chat_clean( $in['preferred_location'] ?? '', 60 ),
		'service_interest'   => ia_chat_clean( $in['service_interest'] ?? '', 200 ),
		'best_time'          => ia_chat_clean( $in['best_time'] ?? '', 120 ),
		'contact_method'     => ia_chat_clean( $in['contact_method'] ?? '', 40 ),
		'language'           => ia_chat_clean( $in['language'] ?? '', 20 ),
		'summary'            => ia_chat_clean( $in['summary'] ?? '', 600 ),
	);
	if ( '' === $row['phone'] && '' === $row['email'] ) {
		return 'Not saved: ask for a phone number or email first.';
	}
	$t        = ia_chat_table();
	$now      = current_time( 'mysql' );
	$existing = $wpdb->get_row( $wpdb->prepare( "SELECT id FROM $t WHERE session = %s", $session ) );
	$row      = array_filter( $row, static function ( $v ) { return '' !== $v; } );
	$row['consent']    = 1;
	$row['updated_at'] = $now;
	$row['messages']   = (int) $ctx['messages'];
	if ( $existing ) {
		$row['emailed_at'] = null; // updated lead goes out again in the next digest
		$wpdb->update( $t, $row, array( 'id' => $existing->id ) );
	} else {
		$row = array_merge(
			$row,
			array(
				'session'      => $session,
				'created_at'   => $now,
				'landing_page' => ia_chat_clean( $ctx['landing'], 300 ),
				'chat_page'    => ia_chat_clean( $ctx['page'], 300 ),
				'referrer'     => ia_chat_clean( $ctx['ref'], 300 ),
				'utm_source'   => ia_chat_clean( $ctx['utm_source'], 100 ),
				'utm_medium'   => ia_chat_clean( $ctx['utm_medium'], 100 ),
				'utm_campaign' => ia_chat_clean( $ctx['utm_campaign'], 150 ),
				'gclid'        => ia_chat_clean( $ctx['gclid'], 200 ),
			)
		);
		$wpdb->insert( $t, $row );
	}
	return 'Saved. A team member will follow up personally.';
}

/* ------------------------------------------------------------------ */
/* REST endpoint                                                       */
/* ------------------------------------------------------------------ */

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'ia-chat/v1',
			'/message',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true',
				'callback'            => 'ia_chat_handle',
			)
		);
	}
);

function ia_chat_handle( WP_REST_Request $req ) {
	if ( ! ia_chat_ready() ) {
		return new WP_REST_Response( array( 'error' => 'unavailable' ), 503 );
	}
	// Simple per-IP rate limit (IP is used only for this counter and never stored).
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? $_SERVER['REMOTE_ADDR'] : '';
	$key = 'ia_chat_rl_' . md5( $ip . wp_salt() );
	$n   = (int) get_transient( $key );
	if ( $n >= 60 ) {
		return new WP_REST_Response( array( 'reply' => 'Thanks for chatting! For anything else, please call 713-268-6963 or text (832) 979-9105.' ), 200 );
	}
	set_transient( $key, $n + 1, HOUR_IN_SECONDS );

	$p        = $req->get_json_params();
	$session  = preg_replace( '/[^a-zA-Z0-9_-]/', '', (string) ( $p['session'] ?? '' ) );
	$incoming = is_array( $p['messages'] ?? null ) ? $p['messages'] : array();
	if ( strlen( $session ) < 8 || ! $incoming ) {
		return new WP_REST_Response( array( 'error' => 'bad_request' ), 400 );
	}
	$incoming = array_slice( $incoming, -24 );
	$messages = array();
	foreach ( $incoming as $m ) {
		$role = ( $m['role'] ?? '' ) === 'assistant' ? 'assistant' : 'user';
		$text = trim( mb_substr( wp_strip_all_tags( (string) ( $m['content'] ?? '' ) ), 0, 1500 ) );
		if ( '' === $text ) {
			continue;
		}
		if ( $messages && end( $messages )['role'] === $role ) {
			$messages[ count( $messages ) - 1 ]['content'] .= "\n" . $text;
		} else {
			$messages[] = array( 'role' => $role, 'content' => $text );
		}
	}
	while ( $messages && 'user' !== $messages[0]['role'] ) {
		array_shift( $messages );
	}
	if ( ! $messages || 'user' !== end( $messages )['role'] ) {
		return new WP_REST_Response( array( 'error' => 'bad_request' ), 400 );
	}

	$ctx = array(
		'page'         => (string) ( $p['page'] ?? '' ),
		'landing'      => (string) ( $p['landing'] ?? '' ),
		'ref'          => (string) ( $p['ref'] ?? '' ),
		'utm_source'   => (string) ( $p['utm_source'] ?? '' ),
		'utm_medium'   => (string) ( $p['utm_medium'] ?? '' ),
		'utm_campaign' => (string) ( $p['utm_campaign'] ?? '' ),
		'gclid'        => (string) ( $p['gclid'] ?? '' ),
		'messages'     => count( $incoming ),
	);

	$saved = false;
	$reply = '';
	for ( $i = 0; $i < 3; $i++ ) {
		$choice = ia_chat_call_llm( $messages );
		if ( is_wp_error( $choice ) ) {
			return new WP_REST_Response( array( 'reply' => "Sorry, I'm having trouble right now. Please call 713-268-6963, text (832) 979-9105, or book at https://713botoxme.com/book-consultation." ), 200 );
		}
		$msg   = $choice['message'];
		$reply = (string) ( $msg['content'] ?? '' );
		$calls = $msg['tool_calls'] ?? array();
		if ( ! $calls ) {
			break;
		}
		$messages[] = array( 'role' => 'assistant', 'content' => $msg['content'] ?? null, 'tool_calls' => $calls );
		foreach ( $calls as $call ) {
			$out = 'Unknown tool.';
			if ( 'save_lead' === ( $call['function']['name'] ?? '' ) ) {
				$args = json_decode( (string) ( $call['function']['arguments'] ?? '{}' ), true );
				$out  = ia_chat_save_lead( $session, is_array( $args ) ? $args : array(), $ctx );
				if ( 0 === strpos( $out, 'Saved' ) ) {
					$saved = true;
				}
			}
			$messages[] = array( 'role' => 'tool', 'tool_call_id' => $call['id'], 'content' => $out );
		}
	}
	return new WP_REST_Response( array( 'reply' => trim( $reply ), 'saved' => $saved ), 200 );
}

/* ------------------------------------------------------------------ */
/* Daily digest                                                        */
/* ------------------------------------------------------------------ */

add_action(
	'init',
	function () {
		if ( ! wp_next_scheduled( 'ia_chat_daily' ) ) {
			$s    = ia_chat_settings();
			$tz   = wp_timezone();
			$next = new DateTime( 'today ' . (int) $s['digest_hour'] . ':00', $tz );
			if ( $next->getTimestamp() <= time() ) {
				$next->modify( '+1 day' );
			}
			wp_schedule_event( $next->getTimestamp(), 'daily', 'ia_chat_daily' );
		}
	}
);

add_action( 'ia_chat_daily', 'ia_chat_send_digest' );
add_action( 'ia_chat_daily', 'ia_chat_build_kb', 20 );

function ia_chat_send_digest() {
	global $wpdb;
	$t     = ia_chat_table();
	$leads = $wpdb->get_results( "SELECT * FROM $t WHERE consent = 1 AND emailed_at IS NULL ORDER BY created_at ASC LIMIT 200" );
	if ( ! $leads ) {
		return 0;
	}
	$s    = ia_chat_settings();
	$rows = '';
	foreach ( $leads as $l ) {
		$src = trim( $l->utm_source . ( $l->utm_campaign ? ' / ' . $l->utm_campaign : '' ) );
		if ( ! $src ) {
			$src = $l->gclid ? 'Google Ads' : ( $l->referrer ? wp_parse_url( $l->referrer, PHP_URL_HOST ) : 'Direct' );
		}
		$rows .= '<tr>'
			. '<td>' . esc_html( wp_date( 'M j, g:i a', strtotime( $l->created_at ) ) ) . '</td>'
			. '<td><strong>' . esc_html( $l->name ) . '</strong></td>'
			. '<td>' . esc_html( $l->phone ) . '<br>' . esc_html( $l->email ) . '</td>'
			. '<td>' . esc_html( $l->contact_method ) . ( $l->best_time ? '<br>' . esc_html( $l->best_time ) : '' ) . '</td>'
			. '<td>' . esc_html( $l->preferred_location ) . '</td>'
			. '<td>' . esc_html( $l->service_interest ) . ( $l->summary ? '<br><small>' . esc_html( $l->summary ) . '</small>' : '' ) . '</td>'
			. '<td>' . esc_html( $l->language ) . '</td>'
			. '<td><small>' . esc_html( $src ) . '<br>' . esc_html( $l->chat_page ) . '</small></td>'
			. '</tr>';
	}
	$html = '<div style="font-family:Arial,sans-serif;font-size:14px">'
		. '<p>' . count( $leads ) . ' new website chat lead(s) for personal follow-up. Every visitor below agreed to be contacted.</p>'
		. '<table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;border-color:#ddd">'
		. '<tr style="background:#f3f3f3"><th>When</th><th>Name</th><th>Phone / Email</th><th>Contact by</th><th>Location</th><th>Interested in</th><th>Lang</th><th>Source / page</th></tr>'
		. $rows . '</table>'
		. '<p style="color:#777">Full list: WordPress admin &rarr; Chat Leads. Health details are never collected in chat; discuss them only by phone or in OptiMantra.</p></div>';
	$sent = wp_mail(
		$s['notify_email'],
		sprintf( 'Website chat leads: %d new (%s)', count( $leads ), wp_date( 'M j' ) ),
		$html,
		array( 'Content-Type: text/html; charset=UTF-8' )
	);
	if ( $sent ) {
		$ids = implode( ',', array_map( 'intval', wp_list_pluck( $leads, 'id' ) ) );
		$wpdb->query( "UPDATE $t SET emailed_at = '" . esc_sql( current_time( 'mysql' ) ) . "' WHERE id IN ($ids)" );
	}
	return $sent ? count( $leads ) : -1;
}

/* ------------------------------------------------------------------ */
/* Admin: settings + leads                                             */
/* ------------------------------------------------------------------ */

add_action(
	'admin_menu',
	function () {
		add_menu_page( 'Chat Leads', 'Chat Leads', 'edit_pages', 'ia-chat-leads', 'ia_chat_leads_page', 'dashicons-format-chat', 26 );
		add_submenu_page( 'ia-chat-leads', 'Chat Assistant Settings', 'Settings', 'manage_options', 'ia-chat-settings', 'ia_chat_settings_page' );
	}
);

function ia_chat_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$s   = ia_chat_settings();
	$msg = '';
	if ( isset( $_POST['ia_chat_save'] ) && check_admin_referer( 'ia_chat_settings' ) ) {
		$s['enabled']      = empty( $_POST['enabled'] ) ? 0 : 1;
		$s['model']        = sanitize_text_field( wp_unslash( $_POST['model'] ?? '' ) );
		$s['name']         = sanitize_text_field( wp_unslash( $_POST['name'] ?? $s['name'] ) );
		$s['notify_email'] = sanitize_email( wp_unslash( $_POST['notify_email'] ?? $s['notify_email'] ) );
		$prov = sanitize_text_field( wp_unslash( $_POST['provider'] ?? 'claude' ) );
		if ( $prov !== $s['provider'] ) {
			$s['model'] = ''; // switch to that provider's default model
		}
		$s['provider'] = 'openai' === $prov ? 'openai' : 'claude';
		$key = trim( sanitize_text_field( wp_unslash( $_POST['api_key'] ?? '' ) ) );
		if ( '' !== $key ) {
			$s['api_key'] = $key;
		}
		$okey = trim( sanitize_text_field( wp_unslash( $_POST['openai_key'] ?? '' ) ) );
		if ( '' !== $okey ) {
			$s['openai_key'] = $okey;
		}
		update_option( IA_CHAT_OPT, $s, false );
		$msg = 'Settings saved.';
	}
	if ( isset( $_POST['ia_chat_kb'] ) && check_admin_referer( 'ia_chat_settings' ) ) {
		$msg = 'Knowledge base rebuilt (' . number_format( ia_chat_build_kb() ) . ' characters).';
	}
	if ( isset( $_POST['ia_chat_digest'] ) && check_admin_referer( 'ia_chat_settings' ) ) {
		$n   = ia_chat_send_digest();
		$msg = $n > 0 ? "Digest sent with $n lead(s)." : ( 0 === $n ? 'No new leads to send.' : 'Email failed to send.' );
	}
	$err = get_option( 'ia_chat_last_error', '' );
	?>
	<div class="wrap">
		<h1>Chat Assistant Settings</h1>
		<?php if ( $msg ) : ?><div class="notice notice-success"><p><?php echo esc_html( $msg ); ?></p></div><?php endif; ?>
		<form method="post">
			<?php wp_nonce_field( 'ia_chat_settings' ); ?>
			<table class="form-table">
				<tr><th>Show chat on website</th><td><label><input type="checkbox" name="enabled" value="1" <?php checked( $s['enabled'], 1 ); ?>> Enabled</label></td></tr>
				<tr><th>AI engine</th><td><select name="provider"><option value="claude" <?php selected( $s['provider'], 'claude' ); ?>>Claude (Anthropic)</option><option value="openai" <?php selected( $s['provider'], 'openai' ); ?>>ChatGPT (OpenAI)</option></select></td></tr>
				<tr><th>Claude API key</th><td><input type="password" name="api_key" class="regular-text" autocomplete="off" placeholder="<?php echo $s['api_key'] ? 'Saved (ends ' . esc_attr( substr( $s['api_key'], -4 ) ) . ') — paste a new key to replace' : 'Paste your key from console.anthropic.com'; ?>"></td></tr>
				<tr><th>OpenAI API key</th><td><input type="password" name="openai_key" class="regular-text" autocomplete="off" placeholder="<?php echo $s['openai_key'] ? 'Saved (ends ' . esc_attr( substr( $s['openai_key'], -4 ) ) . ') — paste a new key to replace' : 'Optional: from platform.openai.com/api-keys'; ?>"></td></tr>
				<tr><th>Model</th><td><input type="text" name="model" value="<?php echo esc_attr( $s['model'] ); ?>" class="regular-text"> <span class="description">Leave blank for the default (claude-sonnet-5-5 or gpt-5-mini).</span></td></tr>
				<tr><th>Assistant name</th><td><input type="text" name="name" value="<?php echo esc_attr( $s['name'] ); ?>"></td></tr>
				<tr><th>Daily lead email to</th><td><input type="email" name="notify_email" value="<?php echo esc_attr( $s['notify_email'] ); ?>" class="regular-text"> <span class="description">Sent every morning at <?php echo (int) $s['digest_hour']; ?>:00 when there are new leads.</span></td></tr>
			</table>
			<p><button class="button button-primary" name="ia_chat_save" value="1">Save settings</button>
			<button class="button" name="ia_chat_kb" value="1">Rebuild knowledge base now</button>
			<button class="button" name="ia_chat_digest" value="1">Send lead digest now</button></p>
		</form>
		<p>Knowledge base last built: <?php echo esc_html( get_option( 'ia_chat_kb_built', 'never' ) ); ?> (<?php echo number_format( strlen( (string) get_option( 'ia_chat_kb', '' ) ) ); ?> characters, refreshed daily from the live site).</p>
		<?php if ( $err ) : ?><p style="color:#b32d2e">Last API error: <?php echo esc_html( $err ); ?></p><?php endif; ?>
	</div>
	<?php
}

function ia_chat_leads_page() {
	global $wpdb;
	$t = ia_chat_table();
	if ( isset( $_GET['export'] ) && check_admin_referer( 'ia_chat_export' ) ) {
		// handled in admin_init
	}
	$leads = $wpdb->get_results( "SELECT * FROM $t ORDER BY created_at DESC LIMIT 500" );
	$url   = wp_nonce_url( admin_url( 'admin.php?page=ia-chat-leads&ia_chat_export=1' ), 'ia_chat_export' );
	echo '<div class="wrap"><h1>Chat Leads <a class="page-title-action" href="' . esc_url( $url ) . '">Export CSV</a></h1>';
	echo '<p>Visitors who agreed in the website chat to be contacted. New leads are emailed each morning to ' . esc_html( ia_chat_settings()['notify_email'] ) . '.</p>';
	echo '<table class="widefat striped"><thead><tr><th>Date</th><th>Name</th><th>Phone</th><th>Email</th><th>Contact by</th><th>Best time</th><th>Location</th><th>Interest</th><th>Summary</th><th>Lang</th><th>Source</th><th>Emailed</th></tr></thead><tbody>';
	if ( ! $leads ) {
		echo '<tr><td colspan="12">No leads yet.</td></tr>';
	}
	foreach ( $leads as $l ) {
		$src = $l->utm_source ? $l->utm_source . ' / ' . $l->utm_campaign : ( $l->gclid ? 'Google Ads' : ( $l->referrer ? wp_parse_url( $l->referrer, PHP_URL_HOST ) : 'Direct' ) );
		echo '<tr><td>' . esc_html( $l->created_at ) . '</td><td>' . esc_html( $l->name ) . '</td><td>' . esc_html( $l->phone ) . '</td><td>' . esc_html( $l->email ) . '</td><td>' . esc_html( $l->contact_method ) . '</td><td>' . esc_html( $l->best_time ) . '</td><td>' . esc_html( $l->preferred_location ) . '</td><td>' . esc_html( $l->service_interest ) . '</td><td>' . esc_html( $l->summary ) . '</td><td>' . esc_html( $l->language ) . '</td><td>' . esc_html( $src ) . '<br><small>' . esc_html( $l->chat_page ) . '</small></td><td>' . esc_html( $l->emailed_at ? $l->emailed_at : '—' ) . '</td></tr>';
	}
	echo '</tbody></table></div>';
}

add_action(
	'admin_init',
	function () {
		if ( empty( $_GET['ia_chat_export'] ) || ! current_user_can( 'edit_pages' ) || ! check_admin_referer( 'ia_chat_export' ) ) {
			return;
		}
		global $wpdb;
		$rows = $wpdb->get_results( 'SELECT created_at,name,phone,email,contact_method,best_time,preferred_location,service_interest,summary,language,landing_page,chat_page,referrer,utm_source,utm_medium,utm_campaign,gclid,emailed_at FROM ' . ia_chat_table() . ' ORDER BY created_at DESC', ARRAY_A );
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=chat-leads-' . wp_date( 'Y-m-d' ) . '.csv' );
		$out = fopen( 'php://output', 'w' );
		if ( $rows ) {
			fputcsv( $out, array_keys( $rows[0] ) );
			foreach ( $rows as $r ) {
				fputcsv( $out, $r );
			}
		}
		fclose( $out );
		exit;
	}
);

/* ------------------------------------------------------------------ */
/* Front-end widget                                                    */
/* ------------------------------------------------------------------ */

add_action(
	'wp_footer',
	function () {
		if ( is_admin() || ! ia_chat_ready() ) {
			return;
		}
		$s    = ia_chat_settings();
		$cfg  = array(
			'endpoint' => esc_url_raw( rest_url( 'ia-chat/v1/message' ) ),
			'name'     => $s['name'],
		);
		?>
<style id="ia-chat-css">
#ia-chat-btn{position:fixed;right:24px;bottom:118px;z-index:99998;display:flex;align-items:center;gap:8px;background:#1f3b2d;color:#fff;border:0;border-radius:28px;padding:12px 18px;font:600 15px/1.2 inherit;box-shadow:0 6px 20px rgba(0,0,0,.2);cursor:pointer}
#ia-chat-btn:hover{background:#2b5240}
#ia-chat-panel{position:fixed;right:24px;bottom:118px;z-index:99999;width:370px;max-width:calc(100vw - 24px);height:540px;max-height:calc(100vh - 140px);background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;font-family:inherit}
#ia-chat-panel.open{display:flex}
#ia-chat-head{background:#1f3b2d;color:#fff;padding:14px 16px;display:flex;justify-content:space-between;align-items:center}
#ia-chat-head b{font-size:16px}#ia-chat-head small{display:block;opacity:.8;font-size:12px}
#ia-chat-close{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}
#ia-chat-log{flex:1;overflow-y:auto;padding:14px;background:#f7f5f1}
.ia-m{max-width:85%;margin:0 0 10px;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}
.ia-m.a{background:#fff;color:#222;border:1px solid #e6e1d8;border-bottom-left-radius:4px}
.ia-m.u{background:#c8a96a;color:#1b1b1b;margin-left:auto;border-bottom-right-radius:4px}
.ia-m a{color:#1f3b2d;text-decoration:underline}
#ia-chat-note{font-size:11px;color:#777;padding:6px 14px;background:#fff;border-top:1px solid #eee}
#ia-chat-form{display:flex;gap:8px;padding:10px;background:#fff;border-top:1px solid #eee}
#ia-chat-in{flex:1;border:1px solid #ccc;border-radius:20px;padding:10px 14px;font-size:15px;resize:none;height:42px;font-family:inherit}
#ia-chat-send{background:#1f3b2d;color:#fff;border:0;border-radius:20px;padding:0 16px;font-weight:600;cursor:pointer}
.ia-typing{opacity:.6;font-style:italic}
@media(max-width:600px){#ia-chat-btn{bottom:104px;right:14px;padding:11px 15px}#ia-chat-panel{right:12px;bottom:12px;height:calc(100vh - 90px);max-height:none}}
</style>
<button id="ia-chat-btn" type="button" aria-label="Open chat"><span aria-hidden="true">&#128172;</span> Questions? Chat with us</button>
<div id="ia-chat-panel" role="dialog" aria-label="Chat with Identity Aesthetics">
	<div id="ia-chat-head"><div><b><?php echo esc_html( $s['name'] ); ?> · Identity Aesthetics</b><small>Virtual assistant · a real team member follows up</small></div><button id="ia-chat-close" type="button" aria-label="Close chat">&times;</button></div>
	<div id="ia-chat-log" aria-live="polite"></div>
	<div id="ia-chat-note">Please don't share medical details here. By sharing your contact info you agree we may call, text or email you about your request. <a href="/privacy">Privacy</a></div>
	<form id="ia-chat-form"><textarea id="ia-chat-in" rows="1" placeholder="Type your message…" maxlength="1500"></textarea><button id="ia-chat-send" type="submit">Send</button></form>
</div>
<script>
(function(){
var C=<?php echo wp_json_encode( $cfg ); ?>;
var SS=window.sessionStorage, LS=window.localStorage;
function g(k){try{return SS.getItem(k)}catch(e){return null}}
function s(k,v){try{SS.setItem(k,v)}catch(e){}}
var q=new URLSearchParams(location.search);
if(!g('ia_chat_landing')){s('ia_chat_landing',location.pathname);s('ia_chat_ref',document.referrer||'');['utm_source','utm_medium','utm_campaign','gclid'].forEach(function(k){if(q.get(k))s('ia_chat_'+k,q.get(k))});}
var sid=g('ia_chat_sid'); if(!sid){sid=(Date.now().toString(36)+Math.random().toString(36).slice(2,12));s('ia_chat_sid',sid);}
var hist=[];try{hist=JSON.parse(g('ia_chat_hist')||'[]')}catch(e){}
var btn=document.getElementById('ia-chat-btn'),panel=document.getElementById('ia-chat-panel'),log=document.getElementById('ia-chat-log'),form=document.getElementById('ia-chat-form'),inp=document.getElementById('ia-chat-in');
var es=(document.documentElement.lang||'').indexOf('es')===0;
var greet=es?'¡Hola! Soy '+C.name+', la asistente virtual de Identity Aesthetics. ¿En qué te puedo ayudar hoy?':'Hi there! I\'m '+C.name+', Identity Aesthetics\' virtual assistant. What can I help you with today?';
function esc(t){return t.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fmt(t){t=esc(t);t=t.replace(/\*\*(.+?)\*\*/g,'$1');t=t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');t=t.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g,'$1<a href="$2" target="_blank" rel="noopener">$2</a>');return t}
function add(role,text){var d=document.createElement('div');d.className='ia-m '+(role==='user'?'u':'a');d.innerHTML=fmt(text);log.appendChild(d);log.scrollTop=log.scrollHeight;return d}
function render(){log.innerHTML='';add('assistant',greet);hist.forEach(function(m){add(m.role,m.content)})}
function open(){panel.classList.add('open');btn.style.display='none';if(!log.childNodes.length)render();setTimeout(function(){inp.focus()},50);try{if(window.gtag)gtag('event','chat_open')}catch(e){}}
function close(){panel.classList.remove('open');btn.style.display=''}
btn.onclick=open;document.getElementById('ia-chat-close').onclick=close;
inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit'))}});
var busy=false;
form.addEventListener('submit',function(e){e.preventDefault();var t=inp.value.trim();if(!t||busy)return;busy=true;inp.value='';hist.push({role:'user',content:t});add('user',t);
var typing=add('assistant',es?'Escribiendo…':'Typing…');typing.classList.add('ia-typing');
var send=[{role:'assistant',content:greet}].concat(hist).slice(-24);
fetch(C.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session:sid,messages:send,page:location.pathname,landing:g('ia_chat_landing'),ref:g('ia_chat_ref'),utm_source:g('ia_chat_utm_source'),utm_medium:g('ia_chat_utm_medium'),utm_campaign:g('ia_chat_utm_campaign'),gclid:g('ia_chat_gclid')})})
.then(function(r){return r.json()}).then(function(d){var a=(d&&d.reply)||'Sorry, something went wrong. Please call 713-268-6963.';typing.remove();hist.push({role:'assistant',content:a});add('assistant',a);s('ia_chat_hist',JSON.stringify(hist.slice(-30)));if(d&&d.saved){try{if(window.gtag)gtag('event','generate_lead',{method:'chat'})}catch(e){}}})
.catch(function(){typing.remove();add('assistant','Sorry, I\'m having trouble connecting. Please call 713-268-6963 or text (832) 979-9105.')})
.then(function(){busy=false})});
if(hist.length&&g('ia_chat_open')==='1')open();
window.addEventListener('pagehide',function(){s('ia_chat_open',panel.classList.contains('open')?'1':'0')});
})();
</script>
		<?php
	},
	50
);
