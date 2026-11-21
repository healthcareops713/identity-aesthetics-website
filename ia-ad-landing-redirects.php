<?php
/**
 * Plugin Name: IA ad landing redirects
 * Description: Google Ads final URLs from the old static site (e.g. /semaglutide/houston,
 *              /botox/conroe) 404 on WordPress. Send them to the matching live page and keep
 *              the query string so gclid / UTM tracking survives. Also keeps the query string on
 *              the theme's legacy redirect map. Added 2026-11-20.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function ia_adlr_target( $path ) {
	$path = strtolower( rtrim( $path, '/' ) );
	if ( '' === $path ) {
		return null;
	}

	// Exact paths first.
	$exact = array(
		'/weight-loss/clinic'     => '/weight-loss',
		'/weight-loss/core'       => '/weight-loss',
		'/weight-loss/houston'    => '/weight-loss',
		'/weight-loss/injections' => '/treatment-glp1-weight-loss-consultation',
		'/peptides/men'           => '/peptide-program-men',
		'/peptides/women'         => '/peptide-program-women',
		'/mens-health/ed'         => '/treatment-erectile-dysfunction',
		'/hormones/women'         => '/treatment-hormone-optimization-women',
	);
	if ( isset( $exact[ $path ] ) ) {
		return $exact[ $path ];
	}

	if ( ! preg_match( '#^/([a-z0-9+-]+)/([a-z0-9-]+)$#', $path, $m ) ) {
		return null;
	}
	$svc  = $m[1];
	$city = $m[2];

	if ( in_array( $svc, array( 'botox', 'wrinkles', 'neurotoxins', 'dysport' ), true ) ) {
		return in_array( $city, array( 'conroe', 'houston', 'katy', 'fulshear' ), true ) ? '/botox-' . $city . '-tx' : '/treatment-botox';
	}

	$map = array(
		'filler'       => 'conroe' === $city ? '/fillers-conroe-tx' : '/injectables',
		'fillers'      => 'conroe' === $city ? '/fillers-conroe-tx' : '/injectables',
		'lip-filler'   => '/treatment-lip-filler',
		'filler-fix'   => '/treatment-botched-filler-correction',
		'balancing'    => '/treatment-complete-facial-balancing',
		'facials'      => '/glo2facial-treatments',
		'skin'         => '/medspa',
		'med-spa'      => '/medspa',
		'medspa'       => '/medspa',
		'microneedling'=> '/microneedling',
		'laser'        => '/treatment-laser-rejuvenation',
		'weight-loss'  => '/weight-loss',
		'semaglutide'  => '/treatment-semaglutide',
		'tirzepatide'  => '/treatment-tirzepatide',
		'glp-1'        => '/treatment-glp1-weight-loss-consultation',
		'glp1'         => '/treatment-glp1-weight-loss-consultation',
		'trt'          => '/treatment-hormone-optimization-men',
		'testosterone' => '/treatment-hormone-optimization-men',
		'mens-health'  => '/treatment-hormone-optimization-men',
		'ed'           => '/treatment-erectile-dysfunction',
		'peptides'     => '/treatment-physician-supervised-peptide-therapy',
		'peptide'      => '/treatment-physician-supervised-peptide-therapy',
		'nad'          => '/longevity-medicine',
		'longevity'    => '/longevity-medicine',
		'anti-aging'   => '/longevity-medicine',
		'sermorelin'   => '/peptides',
	);
	return isset( $map[ $svc ] ) ? $map[ $svc ] : null;
}

add_action(
	'template_redirect',
	function () {
		if ( is_admin() ) {
			return;
		}
		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
		$path = (string) wp_parse_url( $uri, PHP_URL_PATH );
		$qs   = (string) wp_parse_url( $uri, PHP_URL_QUERY );
		if ( '' === $path ) {
			return;
		}
		$path = '/' . ltrim( $path, '/' );

		$to = null;
		// Ad landing paths: only when WordPress has no page there.
		if ( is_404() ) {
			$to = ia_adlr_target( $path );
		}
		// Theme legacy map, but keep the query string (the theme's own handler drops it).
		if ( ! $to && function_exists( 'ia_redirects_map' ) ) {
			$legacy = ia_redirects_map();
			foreach ( array( $path, rtrim( $path, '/' ), $path . '/' ) as $c ) {
				if ( '' !== $c && ! empty( $legacy['legacy'][ $c ] ) && $legacy['legacy'][ $c ] !== $c ) {
					$to = $legacy['legacy'][ $c ];
					break;
				}
			}
			// The ad map wins for paths an ad points at, even if the theme map sends them elsewhere.
			if ( $to ) {
				$ad = ia_adlr_target( $path );
				if ( $ad ) {
					$to = $ad;
				}
			}
		}
		if ( ! $to ) {
			return;
		}
		$dest = home_url( $to );
		if ( '' !== $qs ) {
			$dest .= '?' . $qs;
		}
		wp_redirect( $dest, 301, 'IA ad landing redirects' );
		exit;
	},
	0
);
